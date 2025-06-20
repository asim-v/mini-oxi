const protocolosReducer = (state = [], action) => {
    switch (action.type) {
      case 'ADD_PROTOCOL':
        console.log('ADD_PROTOCOL')
        return [...state, action.payload];
      case 'REMOVE_PROTOCOL':
        console.log('REMOVE_PROTOCOL')
        return state.filter(protocolo => protocolo.id !== action.payload.id);
      case 'UPDATE_PROTOCOL':
        console.log('UPDATE_PROTOCOL')
        return state.map(protocolo =>
          protocolo.id === action.payload.id ? action.payload : protocolo
        );
      default:
        return state;
    }
  };
  
  export default protocolosReducer; 