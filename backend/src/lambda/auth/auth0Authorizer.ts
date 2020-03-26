import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'

import axios from 'axios'

import { certToPEM } from '../utils';

import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-72fy5g9j.auth0.com/.well-known/jwks.json'

// @ts-ignore
const auth0Secret = process.env.AUTH_0_SECRET

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwksRequest = await axios.get(jwksUrl)

  const signingKeys = jwksRequest.data.keys
      .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
          && key.kty === 'RSA' // We are only supporting RSA (RS256)
          && key.kid           // The `kid` must be present to be useful for later
          && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
      ).map(key => {
        return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
      });
  return verify(token, signingKeys[0].publicKey, { algorithms: ['RS256'] }) as JwtPayload;
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


