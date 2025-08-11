declare module 'react-quill' {
  import { Component } from 'react';
  
  interface QuillOptions {
    theme?: string;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    debug?: string | boolean;
    placeholder?: string;
    readOnly?: boolean;
    scrollingContainer?: string | HTMLElement;
    strict?: boolean;
  }
  
  interface ReactQuillProps extends QuillOptions {
    value?: string;
    defaultValue?: string;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (range: any, source: string, editor: any) => void;
    onFocus?: (range: any, source: string, editor: any) => void;
    onBlur?: (previousRange: any, source: string, editor: any) => void;
    onKeyPress?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onKeyUp?: (event: any) => void;
    tabIndex?: number;
    className?: string;
    style?: React.CSSProperties;
  }
  
  export default class ReactQuill extends Component<ReactQuillProps> {}
}

declare module 'react-quill/dist/quill.snow.css';