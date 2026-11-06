export function createLegalConsent(companyId, accountId, storage = () => window.localStorage) {
	const key = `medix:legal-consent:v1:${companyId}:${accountId || 'browser'}`
	function read() {
		try {
			const value = JSON.parse(storage().getItem(key))
			if (value?.version !== 1 || typeof value.policy_read !== 'boolean' || typeof value.marketing_agree !== 'boolean') return null
			return value
		} catch {
			return null
		}
	}
	function accepted() {
		const value = read()
		return value?.policy_read === true && value?.marketing_agree === true
	}
	function save(policyRead, marketingAgree) {
		if (policyRead !== true || marketingAgree !== true) return false
		try {
			storage().setItem(key, JSON.stringify({ version: 1, policy_read: true, marketing_agree: true }))
			return accepted()
		} catch {
			return false
		}
	}
	return { key, read, accepted, save }
}
