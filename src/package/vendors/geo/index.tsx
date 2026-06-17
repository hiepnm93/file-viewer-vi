import { createApp, defineAsyncComponent } from 'vue'
import { readText } from '@/package/common/util'

const GeoViewer = defineAsyncComponent(() => import('./GeoViewer.vue'))

type FeatureCollection = {
  type: 'FeatureCollection';
  features: Array<Record<string, unknown>>;
}

const normalizeGeoJson = (value: any): FeatureCollection => {
  if (value?.type === 'FeatureCollection' && Array.isArray(value.features)) {
    return value
  }
  if (value?.type === 'Feature') {
    return { type: 'FeatureCollection', features: [value] }
  }
  if (value?.type && value?.coordinates) {
    return {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: value, properties: {} }]
    }
  }
  throw new Error('无法识别的 GeoJSON 数据')
}

const parseXml = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  const error = doc.querySelector('parsererror')
  if (error) {
    throw new Error(error.textContent || 'XML 解析失败')
  }
  return doc
}

const parseGeo = async (buffer: ArrayBuffer, type: string): Promise<FeatureCollection> => {
  if (type === 'geojson') {
    return normalizeGeoJson(JSON.parse(await readText(buffer)))
  }
  if (type === 'kml' || type === 'gpx') {
    const toGeoJSON = await import('@tmcw/togeojson')
    const doc = parseXml(await readText(buffer))
    return normalizeGeoJson(type === 'kml' ? toGeoJSON.kml(doc) : toGeoJSON.gpx(doc))
  }
  if (type === 'shp') {
    const { default: shp } = await import('shpjs')
    return normalizeGeoJson(await shp(buffer))
  }
  throw new Error(`不支持 .${type} 地理格式`)
}

/**
 * 地理数据预览。
 *
 * KML / GPX 使用 togeojson 走成熟 XML 转 GeoJSON 链路；Shapefile 使用 shpjs。
 * 最终离线绘制成 SVG，不依赖在线地图瓦片，适合内网和私有化部署。
 */
export default async function renderGeo(buffer: ArrayBuffer, target: HTMLDivElement, type?: string) {
  const normalizedType = (type || 'geojson').toLowerCase()
  const collection = await parseGeo(buffer, normalizedType)
  const app = createApp({
    render: () => <GeoViewer collection={collection as any} type={normalizedType} />
  })
  app.mount(target)
  return app
}
