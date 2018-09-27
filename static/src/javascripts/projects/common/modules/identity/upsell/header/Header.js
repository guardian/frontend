import React from 'preact-compat';

type HeaderProps = {
    title: string,
    subtitle: string
}

const Header = ({ title, subtitle }: HeaderProps) => {
    return (
        <div className="identity-upsell-subheader">
            <div className="identity-wrapper identity-wrapper--wide monocolumn-wrapper">
                <header className="identity-upsell-title identity-upsell-title--hero">
                    <h1 className="identity-upsell-title__title">
                        {title}
                    </h1>
                    <h1 className="identity-upsell-title__subtitle">
                        {subtitle}
                    </h1>
                </header>
            </div>
        </div>
    )
}


export { Header }

