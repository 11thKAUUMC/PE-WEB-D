export function readResult<T>(response: T | { isSuccess: boolean; message: string; result: T }): T {
  if (typeof response === "object" && response !== null && "isSuccess" in response) {
    if (!response.isSuccess) throw new Error(response.message);
    return response.result;
  }
  return response;
}

export async function checkMutationResponse(response: Response) {
  const body = await response.text();
  if (body) readResult(JSON.parse(body));
}
