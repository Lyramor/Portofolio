/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */
'use client'

//Node Modules
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faArrowDown } from '@fortawesome/free-solid-svg-icons';

//Primary Button
const ButtonPrimary = ({
  href,
  target = '_self',
  label,
  icon,
  classes = ''
}) => {
  if (href){
    return (
      <a 
        href={href}
        target={target}
        className={`btn btn-primary ${classes}`}
      >
        {label}
        {icon && 
          <FontAwesomeIcon icon={faDownload} size="lg" className="material-symbols-rounded"/>
        }
      </a>
    )
  } else {
    return (
      <button className={`btn btn-primary ${classes}`}>
        {label}
        {icon && 
          <FontAwesomeIcon icon={faDownload} size="lg" className="material-symbols-rounded"/>
        }
      </button>
    )
  }
}

ButtonPrimary.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  target: PropTypes.string,
  icon: PropTypes.bool,
  classes: PropTypes.string
}

//Outline Button
const ButtonOutline = ({
  href,
  target = '_self',
  label,
  icon,
  classes = ''
}) => {
  if (href){
    return (
      <a 
        href={href}
        target={target}
        className={`btn btn-outline ${classes}`}
      >
        {label}
        {icon && 
          <FontAwesomeIcon icon={faArrowDown} size="lg" className="material-symbols-rounded"/>
        }
      </a>
    )
  } else {
    return (
      <button className={`btn btn-outline ${classes}`}>
        {label}
        {icon && 
          <FontAwesomeIcon icon={faArrowDown} size="lg" className="material-symbols-rounded"/>
        }
      </button>
    )
  }
}

ButtonOutline.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  target: PropTypes.string,
  icon: PropTypes.bool,
  classes: PropTypes.string
}

export {
  ButtonPrimary,
  ButtonOutline
}