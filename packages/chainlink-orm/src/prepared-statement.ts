import { PreparedStatement } from 'pg-promise'

// eslint-disable-next-line import/prefer-default-export
export const selectAllEncryptedVrfKeys = new PreparedStatement({
  name: 'select_all_encrypted_vrf_keys',
  text: 'SELECT * FROM encrypted_vrf_keys',
})
