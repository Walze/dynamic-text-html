export * from './src/barrel'
export * from './src/types'

declare module "*.md" {
    const value: any;
    export default value;
}

declare module "*.html" {
    const value: any;
    export default value;
}