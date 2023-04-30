import {
  SCENARIO_OMITTED,
  getPersonalizedRecommendations,
  getPropertyRecommendations
} from '@crossingminds/beam-react'
import {useLoaderData} from '@remix-run/react'
import type {LoaderArgs, MetaFunction} from '@shopify/remix-oxygen'
import {json} from '@shopify/remix-oxygen'

import {
  BEAM_REACT_OPTIONS,
  getRandomCollectionIds,
  getRandomProductVariantIds
} from '~/beam/config'
import {Collections} from '~/components/Collections'
import {HeroBanner} from '~/components/HeroBanner'
import {NewReleases} from '~/components/NewReleases'
import {OurFavorites} from '~/components/OurFavorites'
import {Recommendations} from '~/components/Recommendations'
import {COLLECTIONS_QUERY} from '~/queries/collection'
import {PRODUCTS_BY_VARIANT_QUERY} from '~/queries/product'
import {commitSession, getSessionAndSessionId} from '~/sessions'

import HeroImage1 from '../../public/hero_banner_1.jpg'
import HeroImage2 from '../../public/hero_banner_2.jpg'
import HeroImage3 from '../../public/hero_banner_3.jpg'

const HERO_IMAGES = [HeroImage1, HeroImage2, HeroImage3]

export const meta: MetaFunction = () => {
  return {
    title: 'Hydrogen',
    description: 'A custom storefront powered by Hydrogen'
  }
}

export const loader = async ({context, request}: LoaderArgs) => {
  const {session, sessionId} = await getSessionAndSessionId(request)

  // TODO: when "collections" property is available, use the following code
  // const {itemProperties: collectionIdsForCollections} =
  //   await getPropertyRecommendations({
  //     ...BEAM_REACT_OPTIONS,
  //     sessionId,
  //     sessionPropertiesScenario: SCENARIO_OMITTED, // TODO: add scenario
  //     propertyName: 'collections',
  //     maxResults: 6
  //   })

  const collectionIdsForCollections = getRandomCollectionIds(4)

  const {nodes: collectionsForCollections} = await context.storefront.query<
    Promise<any>
  >(COLLECTIONS_QUERY, {
    variables: {
      ids: collectionIdsForCollections
    }
  })

  // TODO: when personalized recommendations are working, use the following code
  // const {itemIds: variantIdsForRecommendations} =
  //   await getPersonalizedRecommendations({
  //     ...BEAM_REACT_OPTIONS,
  //     sessionId,
  //     sessionScenario: SCENARIO_OMITTED,
  //     maxResults: 8
  //   })
  const variantIdsForRecommendations = getRandomProductVariantIds(8)

  const {nodes: productVariantsForRecommendations} =
    await context.storefront.query<Promise<any>>(PRODUCTS_BY_VARIANT_QUERY, {
      variables: {
        ids: variantIdsForRecommendations.map(
          variantId => `gid://shopify/ProductVariant/${variantId}`
        )
      }
    })

  const collectionIdsForNewReleases = getRandomCollectionIds(3)
  const {nodes: collectionsForNewReleases} = await context.storefront.query<
    Promise<any>
  >(COLLECTIONS_QUERY, {
    variables: {
      ids: collectionIdsForNewReleases
    }
  })

  // TODO: when personalized recommendations are working, use the following code
  // const {itemIds: variantIdsForOurFavorites} =
  //   await getPersonalizedRecommendations({
  //     ...BEAM_REACT_OPTIONS,
  //     sessionId,
  //     sessionScenario: SCENARIO_OMITTED,
  //     maxResults: 6
  //   })
  const variantIdsForOurFavorites = getRandomProductVariantIds(6)

  const {nodes: productVariantsForOurFavorites} =
    await context.storefront.query<Promise<any>>(PRODUCTS_BY_VARIANT_QUERY, {
      variables: {
        ids: variantIdsForOurFavorites.map(
          variantId => `gid://shopify/ProductVariant/${variantId}`
        )
      }
    })

  return json(
    {
      backgroundImageUrl:
        HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)],
      collectionsForCollections,
      collectionsForNewReleases,
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

export default function Index() {
  const {
    backgroundImageUrl,
    collectionsForCollections,
    collectionsForNewReleases,
    productVariantsForOurFavorites,
    productVariantsForRecommendations
  } = useLoaderData<typeof loader>()

  return (
    <div>
      <HeroBanner backgroundImageUrl={backgroundImageUrl} />
      <Collections collections={collectionsForCollections} />
      <Recommendations
        productVariants={productVariantsForRecommendations}
        title="Recommendations for you"
      />
      <NewReleases collections={collectionsForNewReleases} />
      <OurFavorites productVariants={productVariantsForOurFavorites} />
    </div>
  )
}
