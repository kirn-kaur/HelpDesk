export const validate = (schema) => (request, response, next) => {
  const result = schema.safeParse({
    body: request.body,
    query: request.query,
    params: request.params,
  });
  if (!result.success) {
    return response
      .status(400)
      .json({
        message: "Please check the submitted information.",
        errors: result.error.flatten().fieldErrors,
      });
  }
  request.validated = result.data;
  next();
};
