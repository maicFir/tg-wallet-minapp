import React from 'react';

// Reown AppKit Web Components 类型声明
// 兼容 react-jsx 模式下的 JSX 自定义元素
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                label?: string;
                disabled?: boolean;
                balance?: 'show' | 'hide';
                size?: 'sm' | 'md';
                loadingLabel?: string;
            };
            'appkit-network-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'appkit-account-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                balance?: 'show' | 'hide';
            };
            'appkit-connect-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                label?: string;
                loadingLabel?: string;
            };
        }
    }
}

export { };
