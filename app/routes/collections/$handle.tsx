import {getPersonalizedRecommendations} from '@crossingminds/beam-react'
import {useLoaderData} from '@remix-run/react'
import type {LoaderArgs, MetaFunction} from '@shopify/remix-oxygen'
import {json} from '@shopify/remix-oxygen'

import {BEAM_REACT_OPTIONS} from '~/beam/config'
import {Collection} from '~/components/Collection'
import {COLLECTION_QUERY} from '~/queries/collection'
import {PRODUCTS_BY_VARIANT_QUERY} from '~/queries/product'
import {commitSession, getSessionAndSessionId} from '~/sessions'
import {RECOMMENDATION_SCENARIOS} from '~/utils/recommendations'
import {SHOPIFY_ENTITY_TYPES, getIdFromShopifyEntityId} from '~/utils/shopify'

export async function action({context, params, request}: LoaderArgs) {
  const cookie = request.headers.get('Cookie')
  const beamEnabled = (cookie || '').indexOf('__beamEnabled=1') >= 0
  const {handle} = params
  const {sessionId} = await getSessionAndSessionId(request)
  const [formData] = await Promise.all([request.formData()])
  const collectionId = formData.get('collectionId') as string
  const nextCursor = formData.get('nextCursor') as string

  let variantIdsForCollection: string[] = []
  let newNextCursor: string | undefined = ''

  if (beamEnabled) {
    const {itemIds, nextCursor: beamNextCursor} =
      await getPersonalizedRecommendations({
        ...BEAM_REACT_OPTIONS,
        sessionId,
        sessionScenario: RECOMMENDATION_SCENARIOS.PLP_FILTER_BY_COLLECTION,
        filters: [
          {
            itemPropertyName: 'collections',
            operator: 'eq',
            value: collectionId
          }
        ],
        cursor: nextCursor,
        maxResults: 12
      })

    variantIdsForCollection = itemIds
    newNextCursor = beamNextCursor
  } else {
    const {collection} = await context.storefront.query<Promise<any>>(
      COLLECTION_QUERY,
      {
        variables: {
          handle,
          first: 12,
          startCursor: nextCursor
        }
      }
    )

    variantIdsForCollection = collection.products.nodes.map(node =>
      getIdFromShopifyEntityId(
        SHOPIFY_ENTITY_TYPES.PRODUCT_VARIANT,
        node.variants.nodes[0].id
      )
    )
    newNextCursor = collection.products.pageInfo.startCursor
  }

  const {nodes: productVariantsForCollection} = await context.storefront.query<
    Promise<any>
  >(PRODUCTS_BY_VARIANT_QUERY, {
    variables: {
      ids: variantIdsForCollection.map(
        variantId => `gid://shopify/ProductVariant/${variantId}`
      )
    }
  })

  return json({
    nextCursor: newNextCursor,
    productVariants: productVariantsForCollection
  })
}

export const loader = async ({context, params, request}: LoaderArgs) => {
  const {session, sessionId} = await getSessionAndSessionId(request)
  const cookie = request.headers.get('Cookie')
  const beamEnabled = (cookie || '').indexOf('__beamEnabled=1') >= 0
  const {handle} = params
  const {collection} = await context.storefront.query<Promise<any>>(
    COLLECTION_QUERY,
    {
      variables: {
        handle,
        first: 12
      }
    }
  )

  if (!collection?.id) {
    throw new Response(undefined, {status: 404})
  }

  const {itemIds: variantIdsForCollection, nextCursor} =
    await getPersonalizedRecommendations({
      ...BEAM_REACT_OPTIONS,
      sessionId,
      sessionScenario: RECOMMENDATION_SCENARIOS.PLP_FILTER_BY_COLLECTION,
      filters: [
        {
          itemPropertyName: 'collections',
          operator: 'eq',
          value: getIdFromShopifyEntityId(
            SHOPIFY_ENTITY_TYPES.COLLECTION,
            collection.id
          )
        }
      ],
      maxResults: 12
    })
  const staticVariantIdsForCollection = collection.products.nodes.map(node =>
    getIdFromShopifyEntityId(
      SHOPIFY_ENTITY_TYPES.PRODUCT_VARIANT,
      node.variants.nodes[0].id
    )
  )

  const {nodes: productVariantsForCollection} = await context.storefront.query<
    Promise<any>
  >(PRODUCTS_BY_VARIANT_QUERY, {
    variables: {
      ids: (beamEnabled
        ? variantIdsForCollection
        : staticVariantIdsForCollection
      ).map(variantId => `gid://shopify/ProductVariant/${variantId}`)
    }
  })

  return json(
    {
      collection,
      nextCursor: beamEnabled
        ? nextCursor
        : collection.products.pageInfo.startCursor,
      productVariantsForCollection
    },
    {headers: {'Set-Cookie': await commitSession(session)}}
  )
}

export const shouldRevalidate = () => false

export const meta: MetaFunction<typeof loader> = ({data: {collection}}) => {
  return {
    title: `${collection.title} - Crossing Minds Beam Demo Store`,
    description: collection.title
  }
}

export default function CollectionHandle() {
  const {collection, nextCursor, productVariantsForCollection} =
    useLoaderData<typeof loader>()

  return (
    <Collection
      collection={collection}
      initialNextCursor={nextCursor}
      initialProductVariants={productVariantsForCollection}
    />
  )
}
