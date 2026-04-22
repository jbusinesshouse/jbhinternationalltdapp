import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function HtmlRender({ html }: { html: string }) {
    const { width } = useWindowDimensions();

    return (
        <RenderHtml
            contentWidth={width}
            source={{ html }}
            enableCSSInlineProcessing={true}
            tagsStyles={{
                // Bold
                b: { fontWeight: 'bold' },
                strong: { fontWeight: 'bold' },

                // Italic
                i: { fontStyle: 'italic' },
                em: { fontStyle: 'italic' },

                // Underline
                u: { textDecorationLine: 'underline' },

                // Lists
                ul: { paddingLeft: 20, marginBottom: 10 },
                ol: { paddingLeft: 20, marginBottom: 10 },
                li: { marginBottom: 6 },

                // Paragraph
                p: { fontSize: 14, lineHeight: 22, marginBottom: 10 },
                div: { fontSize: 14, lineHeight: 22, marginBottom: 10 },

                // Fallback for messy spans
                span: { fontSize: 14, lineHeight: 22 },

                // Fallback for inline styles (italic inside u/span)
                '*': { flexWrap: 'wrap' },
            }}
            baseStyle={{ color: '#333', flexWrap: 'wrap' }}
        />
    );
}