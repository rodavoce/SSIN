const messages = (state = [], action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [
        ...state,
        {
          text: action.text,
          severity: action.severity
        }
      ];
    default:
      return state;
  }
}

export default messages;