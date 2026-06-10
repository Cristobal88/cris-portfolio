import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface CtaButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const CtaButton = React.forwardRef<HTMLAnchorElement, CtaButtonProps>(
  ({ variant = 'primary', children, ...props }, ref) => {
    return (
      <a ref={ref} className={`cta-${variant}`} {...props}>
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
