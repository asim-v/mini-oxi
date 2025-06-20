// src/actions/protocolActions.js

// Acción sincrónica para añadir un protocolo
export const addProtocol = (protocolo) => ({
  type: 'ADD_PROTOCOL',
  payload: protocolo,
});
