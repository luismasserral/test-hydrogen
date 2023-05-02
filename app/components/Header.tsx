import {useMatches} from '@remix-run/react'
import type {FunctionComponent} from 'react'

import {
  headerInnerStyle,
  headerStyle,
  headerTitleStyle,
  headerToggleStyle
} from './Header.css'
import {HeaderCart} from './HeaderCart'
import {Toggle} from './Toggle'

interface HeaderProps {
  openDrawer: () => void
}

export const Header: FunctionComponent<HeaderProps> = ({openDrawer}) => {
  const [root] = useMatches()
  const cart: any = root?.data?.cart

  return (
    <header className={headerStyle}>
      <div className={headerInnerStyle}>
        <a href="/">
          <h1 className={headerTitleStyle}>Carrera</h1>
        </a>
        <Toggle className={headerToggleStyle} />
        <HeaderCart cart={cart} openDrawer={openDrawer} />
      </div>
    </header>
  )
}
