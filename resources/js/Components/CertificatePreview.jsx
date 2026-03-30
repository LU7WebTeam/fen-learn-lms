/**
 * CertificatePreview – renders the certificate template as a scaled HTML/CSS preview.
 *
 * Props:
 *   template        – the certificate_template JSON object
 *   dynamicValues   – object with real or sample values for dynamic fields
 *   customFonts     – array of available custom font objects (for builder use)
 *   platformName    – string shown when branding.logo_text is empty
 *   width           – target render width in px (default 520)
 */

const PAGE_DIMS = {
    a4:     { landscape: [297, 210], portrait: [210, 297] },
    letter: { landscape: [279.4, 215.9], portrait: [215.9, 279.4] },
};

const PX_PER_MM = 3.7795;
const PX_PER_PT = 96 / 72;

export default function CertificatePreview({
    template,
    dynamicValues = {},
    customFonts = [],
    platformName = 'FENLearn',
    width = 520,
}) {
    const size        = template?.size        || 'a4';
    const orientation = template?.orientation || 'landscape';
    const [pageW, pageH] = PAGE_DIMS[size]?.[orientation] || [297, 210];

    const nativeW  = pageW * PX_PER_MM;
    const nativeH  = pageH * PX_PER_MM;
    const scale    = width / nativeW;
    const previewH = nativeH * scale;

    const mmToPx = (mm) => mm * PX_PER_MM;
    const ptToPx = (pt) => pt * PX_PER_PT;

    const bg       = template?.background || {};
    const branding = template?.branding   || {};
    const fields   = template?.fields     || [];
    const signatory = template?.signatory || {};

    const selectedCustomFont = customFonts.find(f => Number(f.id) === Number(template?.custom_font_id));
    const fontFamily = selectedCustomFont?.family || template?.font_family || 'DejaVu Sans';

    const showTopBar    = branding.show_top_bar    ?? true;
    const showBottomBar = branding.show_bottom_bar ?? true;
    const topBarPct     = showTopBar    ? 8.5 : 0;
    const bottomBarPct  = showBottomBar ? 6.7 : 0;
    const accentPct     = showTopBar    ? 1.4 : 0;
    const accent2Pct    = showBottomBar ? 1.0 : 0;

    const topBarMm    = (topBarPct    / 100) * pageH;
    const bottomBarMm = (bottomBarPct / 100) * pageH;

    const bgStyle = bg.type === 'image' && bg.image_url
        ? { backgroundImage: `url(${bg.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: bg.color || '#fdf8f4' };

    // Merge signatory into dynamic values
    const resolvedDynamic = {
        signatory_name:  signatory.name  || '',
        signatory_title: signatory.title || '',
        ...dynamicValues,
    };

    function getFieldText(field) {
        if (field.type === 'dynamic') return resolvedDynamic[field.id] || '';
        return field.text || '';
    }

    return (
        <div style={{ width, height: previewH, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            {/* Inject custom font-face if available */}
            {selectedCustomFont?.regular_url && (
                <style>{`
                    @font-face {
                        font-family: '${fontFamily}';
                        src: url('${selectedCustomFont.regular_url}') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }
                `}</style>
            )}

            {/* Scaled native-size canvas */}
            <div style={{
                width: nativeW,
                height: nativeH,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'relative',
                fontFamily: `'${fontFamily}', 'DejaVu Sans', sans-serif`,
                ...bgStyle,
            }}>
                {/* Top bar */}
                {showTopBar && (
                    <>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            height: `${topBarPct}%`,
                            background: branding.top_bar_color || '#8B1A4A',
                        }} />
                        <div style={{
                            position: 'absolute', top: `${topBarPct}%`, left: 0, right: 0,
                            height: `${accentPct}%`,
                            background: branding.accent_color || '#C8A96E',
                        }} />
                        {(branding.show_logo ?? true) && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                height: `${topBarPct}%`,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    color: '#fff',
                                    fontSize: ptToPx(topBarMm * 0.35),
                                    fontWeight: 'bold',
                                    letterSpacing: 4,
                                }}>
                                    {branding.logo_text || platformName}
                                </div>
                                {branding.tagline && (
                                    <div style={{
                                        color: '#F0D9A8',
                                        fontSize: ptToPx(topBarMm * 0.17),
                                        marginTop: mmToPx(1),
                                    }}>
                                        {branding.tagline}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Bottom bar */}
                {showBottomBar && (
                    <>
                        <div style={{
                            position: 'absolute', bottom: `${bottomBarPct}%`, left: 0, right: 0,
                            height: `${accent2Pct}%`,
                            background: branding.accent_color || '#C8A96E',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: `${bottomBarPct}%`,
                            background: branding.bottom_bar_color || '#8B1A4A',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: `${mmToPx(bottomBarMm * 0.3)}px ${mmToPx(pageW * 0.067)}px`,
                        }}>
                            <span style={{ color: '#F0D9A8', fontSize: ptToPx(bottomBarMm * 0.3) }}>
                                {resolvedDynamic.completion_date || ''}
                            </span>
                            <span style={{
                                color: '#fff',
                                fontSize: ptToPx(bottomBarMm * 0.32),
                                fontWeight: 'bold',
                            }}>
                                Certificate of Completion
                            </span>
                            <span style={{ color: '#F0D9A8', fontSize: ptToPx(bottomBarMm * 0.27) }}>
                                {resolvedDynamic.certificate_id ? `ID: ${resolvedDynamic.certificate_id}` : ''}
                            </span>
                        </div>
                    </>
                )}

                {/* Dynamic / static fields */}
                {fields.filter(f => f.visible).map(field => {
                    const text = getFieldText(field);
                    if (!text) return null;
                    const textAlign = field.align || 'center';
                    const leftStyle = textAlign === 'left'
                        ? { paddingLeft: `${field.x || 0}%`, textAlign: 'left' }
                        : textAlign === 'right'
                            ? { paddingRight: `${100 - (field.x || 0)}%`, textAlign: 'right' }
                            : {};
                    return (
                        <div key={field.id} style={{
                            position: 'absolute',
                            top: `${field.y || 0}%`,
                            left: 0, right: 0,
                            fontSize: ptToPx(field.font_size || 12),
                            color: field.color || '#1e1e2e',
                            fontWeight: field.bold   ? 'bold'   : 'normal',
                            fontStyle:  field.italic ? 'italic' : 'normal',
                            textAlign,
                            lineHeight: 1,
                            ...leftStyle,
                        }}>
                            {text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
