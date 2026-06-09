import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { trackCtaClick } from '@/lib/analytics'

interface CtaButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  gaLabel?: string
}

const CtaButton = React.forwardRef<HTMLAnchorElement, CtaButtonProps>(
  ({ variant = 'primary', children, gaLabel, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (gaLabel) trackCtaClick(gaLabel)
      onClick?.(e)
    }
    return (
      <a ref={ref} className={`cta-${variant}`} onClick={handleClick} {...props}>
        <span>{children}</span>
        {variant !== 'ghost' && (
          <div className="cta-icon-wrapper">
            <ArrowUpRight className="cta-icon" size={14} strokeWidth={2.5} />
          </div>
        )}
      </a>
    )
  }
)

CtaButton.displayName = 'CtaButton'

export { CtaButton }
