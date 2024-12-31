const cache = new Map()

class CacheHelper {
	async get(key) {
		return cache.get(key)
	}

	async set(key, value) {
		cache.set(key, value)
	}

	async del(key) {
		cache.delete(key)
	}

	async hget(key, field) {
		return cache.get(key)?.get(field)
	}

	async hset(key, field, value) {
		if (!cache.has(key)) cache.set(key, new Map())
		const map = cache.get(key)
		if (map) {
			map.set(field, value)
		}
	}

	async hdel(key, field) {
		cache.get(key)?.delete(field)
	}

	async hgetall(key) {
		const map = cache.get(key)
		if (map) {
			const result = {}
			for (const [field, value] of map.entries()) {
				result[field] = value
			}
			return result
		}
		return {}
	}

	async clear() {
		cache.clear()
	}
}

export default new CacheHelper()