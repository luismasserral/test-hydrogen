import type {ProductVariant} from '@shopify/hydrogen/storefront-api-types'
import type {FunctionComponent} from 'react'

import {
  newReleasesItemStyle,
  newReleasesItemTitleStyle
} from './NewReleasesItem.css'

interface NewReleasesItemProps {
  productVariant: ProductVariant
}

export const NewReleasesItem: FunctionComponent<NewReleasesItemProps> = ({
  productVariant
}) => {
  return (
    <div
      className={newReleasesItemStyle}
      style={{
        backgroundImage: `url(${productVariant.image?.url})`
      }}
    >
      <p className={newReleasesItemTitleStyle}>
        {productVariant.product.title}
      </p>
    </div>
  )
}
