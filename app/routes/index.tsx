import {
  getPersonalizedRecommendations,
  getPropertyRecommendations
} from '@crossingminds/beam-react'
import {useLoaderData} from '@remix-run/react'
import type {LoaderArgs, MetaFunction} from '@shopify/remix-oxygen'
import {json} from '@shopify/remix-oxygen'

import {
  BEAM_DISABLED_COLLECTION_IDS_RECOMMENDATIONS,
  BEAM_DISABLED_PRODUCT_VARIANT_IDS_RECOMMENDATIONS,
  BEAM_REACT_OPTIONS
} from '~/beam/config'
import {Collections} from '~/components/Collections'
import {HeroBanner} from '~/components/HeroBanner'
import {NewReleases} from '~/components/NewReleases'
import {OurFavorites} from '~/components/OurFavorites'
import {Recommendations} from '~/components/Recommendations'
import {COLLECTIONS_QUERY} from '~/queries/collection'
import {PRODUCTS_BY_VARIANT_QUERY} from '~/queries/product'
import {commitSession, getSessionAndSessionId} from '~/sessions'
import {
  RECOMMENDATION_SCENARIOS,
  removeDuplicatedIdsAndGetFirstNth
} from '~/utils/recommendations'

import HeroImage1 from '../../public/hero_banner_1.jpg'
import HeroImage2 from '../../public/hero_banner_2.jpg'
import HeroImage3 from '../../public/hero_banner_3.jpg'

const HERO_IMAGES = [HeroImage1, HeroImage2, HeroImage3]

export const loader = async ({context, request}: LoaderArgs) => {
  const {session, sessionId} = await getSessionAndSessionId(request)
  const cookie = request.headers.get('Cookie')
  const beamEnabled = (cookie || '').indexOf('__beamEnabled=1') >= 0

  const {itemProperties: collectionIdsForCollections} =
    await getPropertyRecommendations({
      ...BEAM_REACT_OPTIONS,
      sessionId,
      sessionPropertiesScenario:
        RECOMMENDATION_SCENARIOS.HOME_COLLECTIONS_FOR_YOU,
      propertyName: 'collections',
      maxResults: 6
    })
  const staticCollectionIdsForCollections =
    BEAM_DISABLED_COLLECTION_IDS_RECOMMENDATIONS

  const {nodes: collectionsForCollections} = await context.storefront.query<
    Promise<any>
  >(COLLECTIONS_QUERY, {
    variables: {
      ids: (beamEnabled
        ? collectionIdsForCollections
        : staticCollectionIdsForCollections
      ).map(collectionId => `gid://shopify/Collection/${collectionId}`)
    }
  })

  const {itemIds: variantIdsForRecommendations} =
    await getPersonalizedRecommendations({
      ...BEAM_REACT_OPTIONS,
      sessionId,
      sessionScenario: RECOMMENDATION_SCENARIOS.HOME_RECOMMENDATIONS_FOR_YOU,
      maxResults: 8
    })
  const staticVariantIdsForRecommendations =
    BEAM_DISABLED_PRODUCT_VARIANT_IDS_RECOMMENDATIONS.slice(24, 32)

  const {nodes: productVariantsForRecommendations} =
    await context.storefront.query<Promise<any>>(PRODUCTS_BY_VARIANT_QUERY, {
      variables: {
        ids: (beamEnabled
          ? variantIdsForRecommendations
          : staticVariantIdsForRecommendations
        ).map(variantId => `gid://shopify/ProductVariant/${variantId}`)
      }
    })

  const {itemIds: variantIdsForNewReleases} =
    await getPersonalizedRecommendations({
      ...BEAM_REACT_OPTIONS,
      sessionId,
      sessionScenario: RECOMMENDATION_SCENARIOS.HOME_NEW_RELEASES_FOR_YOU,
      maxResults: 11
    })
  const staticVariantIdsForNewReleases =
    BEAM_DISABLED_PRODUCT_VARIANT_IDS_RECOMMENDATIONS.slice(32, 35)

  const {nodes: productVariantsForNewReleases} = await context.storefront.query<
    Promise<any>
  >(PRODUCTS_BY_VARIANT_QUERY, {
    variables: {
      ids: (beamEnabled
        ? removeDuplicatedIdsAndGetFirstNth(
            variantIdsForNewReleases,
            variantIdsForRecommendations,
            3
          )
        : staticVariantIdsForNewReleases
      ).map(variantId => `gid://shopify/ProductVariant/${variantId}`)
    }
  })

  const {itemIds: variantIdsForOurFavorites} =
    await getPersonalizedRecommendations({
      ...BEAM_REACT_OPTIONS,
      sessionId,
      sessionScenario: RECOMMENDATION_SCENARIOS.HOME_OUR_FAVORITES,
      maxResults: 17
    })
  const staticVariantIdsForOurFavorites =
    BEAM_DISABLED_PRODUCT_VARIANT_IDS_RECOMMENDATIONS.slice(35, 41)

  const {nodes: productVariantsForOurFavorites} =
    await context.storefront.query<Promise<any>>(PRODUCTS_BY_VARIANT_QUERY, {
      variables: {
        ids: (beamEnabled
          ? removeDuplicatedIdsAndGetFirstNth(
              variantIdsForOurFavorites,
              [...variantIdsForNewReleases, ...variantIdsForNewReleases],
              6
            )
          : staticVariantIdsForOurFavorites
        ).map(variantId => `gid://shopify/ProductVariant/${variantId}`)
      }
    })

  return json(
    {
      backgroundImageUrl: HERO_IMAGES[
        Math.floor(Math.random() * HERO_IMAGES.length)
      ] as string,
      collectionsForCollections,
      productVariantsForNewReleases,
      productVariantsForOurFavorites,
      productVariantsForRecommendations
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    }
  )
}

export const shouldRevalidate = () => false

export const meta: MetaFunction = () => {
  return {
    title: 'Carrera - Crossing Minds Beam Demo Store',
    description: 'A Crossing Minds demo store'
  }
}

export default function Index() {
  const {
    backgroundImageUrl,
    collectionsForCollections,
    productVariantsForNewReleases,
    productVariantsForOurFavorites,
    productVariantsForRecommendations
  } = useLoaderData<typeof loader>()

  return (
    <div>
      <HeroBanner backgroundImageUrl={backgroundImageUrl} />
      <Collections collections={collectionsForCollections} />
      <Recommendations
        productVariants={productVariantsForRecommendations}
        title="Picked just for you"
      />
      <NewReleases productVariants={productVariantsForNewReleases} />
      <OurFavorites productVariants={productVariantsForOurFavorites} />
    </div>
  )
}
