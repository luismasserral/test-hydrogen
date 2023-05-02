import {globalStyle, style} from '@vanilla-extract/css'

import {vars} from '~/styles/theme.css'

export const toggleStyle = style({
  display: 'inline-block',
  height: 24,
  margin: 10,
  width: 40
})

export const toggleInputStyle = style({
  display: 'none'
})

export const toggleLabelStyle = style({
  backgroundColor: vars.colors.lightGrey04,
  borderRadius: 34,
  cursor: 'pointer',
  height: 24,
  left: 0,
  position: 'absolute',
  top: 0,
  transition: 'background-color 0.3s',
  width: 40,
  ':before': {
    backgroundColor: vars.colors.white,
    backgroundImage:
      'url(https://cdn.shopify.com/app-store/listing_images/9c99d278e86e1ea0ce5f3ca02b72a63f/icon/CI7LndPFtv0CEAE=.png)',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px 16px',
    borderRadius: '50%',
    boxShadow: '0px 2px 5px 0px rgba(0, 0, 0, 0.3)',
    content: '',
    filter: 'grayscale(100%)',
    height: 20,
    left: 2,
    position: 'absolute',
    top: 2,
    transition: 'transform 0.3s',
    width: 20
  }
})

globalStyle(`${toggleInputStyle}:checked + ${toggleLabelStyle}`, {
  backgroundColor: 'transparent',
  backgroundImage: 'linear-gradient(119deg,#7adfff,#6437e3)'
})

globalStyle(`${toggleInputStyle}:checked + ${toggleLabelStyle}:before`, {
  filter: 'none',
  transform: 'translateX(16px)'
})
