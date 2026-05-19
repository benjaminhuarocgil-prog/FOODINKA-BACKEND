import { verifyRuc } from '../../shared/services/sunat.service.js'

export async function checkRuc(req, res) {
  const { ruc } = req.params
  const data = await verifyRuc(ruc)
  res.json({ success: true, data })
}