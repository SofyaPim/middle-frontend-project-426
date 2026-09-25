export const schema: {
  [path: string]: {
    [method: string]: {
      args: any;
      data: any;
      error: any;
    };
  };
};
export const components: {
  schemas: Record<string, any>;
};