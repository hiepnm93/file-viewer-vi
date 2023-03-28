import renders from "@/package/vendors/renders";

const errorHandler = renders.get('error');

export function getExtend(name: string) {
  const dot = name.lastIndexOf('.')
  return name.substring(dot + 1);
}

export async function render(buffer: ArrayBuffer, type: string, target: HTMLDivElement) {
  const handler = renders.get(type.toLowerCase());
  if (handler) {
    return handler(buffer, target);
  }
  if (errorHandler) {
    return errorHandler(buffer, target, type)
  }
}
