export * from './src/barrel'

declare module "*.md";

declare module "*.html" {
    const value: any;
    export default value;
}