import {type LoaderArgs, json, redirect} from '@shopify/remix-oxygen'

import {cartAdd, cartCreate, cartRemove} from '~/api/cart'

export async function action({request, context}: LoaderArgs) {
  const {session, storefront} = context
  const headers = new Headers()

  const [formData, storedCartId] = await Promise.all([
    request.formData(),
    session.get('cartId')
  ])

  let cartId = storedCartId
  const status = 200
  let result

  const cartAction = formData.get('cartAction')
  const countryCode = formData.get('countryCode') || undefined

  switch (cartAction) {
    case 'ADD_TO_CART':
      const lines = formData.get('lines')
        ? JSON.parse(String(formData.get('lines')))
        : []

      if (!cartId) {
        result = await cartCreate({
          input: countryCode ? {lines, buyerIdentity: {countryCode}} : {lines},
          storefront
        })
      } else {
        result = await cartAdd({
          cartId,
          lines,
          storefront
        })
      }

      cartId = result.cart.id
      break
    case 'REMOVE_FROM_CART':
      const lineIds = formData.get('linesIds')
        ? JSON.parse(String(formData.get('linesIds')))
        : []

      if (!lineIds.length) {
        throw new Error('No lines to remove')
      }

      result = await cartRemove({
        cartId,
        lineIds,
        storefront
      })

      cartId = result.cart.id
      break
    default:
      throw new Error('Invalid cart action')
  }

  /**
   * The Cart ID may change after each mutation. We need to update it each time in the session.
   */
  session.set('cartId', cartId)
  headers.set('Set-Cookie', await session.commit())

  const {cart, errors} = result
  return json({cart, errors}, {status, headers})
}

export const loader = async () => {
  return redirect('/')
}

export default function Cart() {
  return <></>
}
