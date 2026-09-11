import React from "react";

function LegalPage({
    eyebrow,
    title,
    effectiveDate,
    intro = "",
    sections = [],
    onBack,
    noticeHref = "",
    noticeLabel = "",
}) {
    return (
        <div className="App info-page legal-page">
            <header className="info-topbar">
                <button
                    type="button"
                    className="info-back-button"
                    onClick={onBack}
                >
                    ← MAIN MENU
                </button>

                <div className="info-brand">
                    GG
                </div>
            </header>

            <main className="info-screen legal-screen">
                <div className="info-heading legal-heading">
                    <span>
                        {eyebrow}
                    </span>

                    <h1>
                        {title}
                    </h1>

                    {intro && (
                        <p>
                            {intro}
                        </p>
                    )}

                    {effectiveDate && (
                        <p className="legal-effective-date">
                            Effective Date: {effectiveDate}
                        </p>
                    )}
                </div>

                <div className="legal-document">
                    {sections.map((section, sectionIndex) => (
                        <section
                            className="legal-section"
                            key={`${section.title}-${sectionIndex}`}
                        >
                            <h2>
                                {section.title}
                            </h2>

                            {section.paragraphs?.map((paragraph, paragraphIndex) => (
                                <p key={`${section.title}-p-${paragraphIndex}`}>
                                    {paragraph}
                                </p>
                            ))}

                            {section.items?.length > 0 && (
                                <ul>
                                    {section.items.map((item, itemIndex) => (
                                        <li key={`${section.title}-li-${itemIndex}`}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                {noticeHref && noticeLabel && (
                    <a
                        className="legal-notice-link"
                        href={noticeHref}
                    >
                        {noticeLabel} ↗
                    </a>
                )}
            </main>
        </div>
    );
}

export default LegalPage;
