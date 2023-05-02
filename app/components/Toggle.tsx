import {useMatches} from '@remix-run/react'
import classNames from 'classnames'
import cookies from 'js-cookie'
import type {FunctionComponent} from 'react'

import {toggleInputStyle, toggleLabelStyle, toggleStyle} from './Toggle.css'

interface ToggleProps {
  className: string
}

export const Toggle: FunctionComponent<ToggleProps> = ({className}) => {
  const [root] = useMatches()
  const beamEnabled = root?.data?.beamEnabled

  const handleOnChange = event => {
    cookies.set('__beamEnabled', event.target.checked ? '1' : '0')
    window.location.reload()
  }

  return (
    <div className={classNames([toggleStyle, className])}>
      <input
        defaultChecked={beamEnabled}
        className={toggleInputStyle}
        id="toggle"
        onChange={handleOnChange}
        type="checkbox"
      />
      <label className={toggleLabelStyle} htmlFor="toggle" />
    </div>
  )
}
