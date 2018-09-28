export * from './src/barrel'

declare module "*.md" {
    const value: any;
    export default value;
}

declare module "*.html" {
    const value: any;
    export default value;
}