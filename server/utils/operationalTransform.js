const transformOperation = (operation1, operation2) => {
  // If the operations are at different positions, no transform needed
  if (operation1.position > operation2.position + (operation2.length || 0) || 
      operation2.position > operation1.position + (operation1.length || 0)) {
    return operation1;
  }

  // Adjust operation1's position based on operation2's effect
  if (operation2.type === 'insert') {
    if (operation1.position > operation2.position) {
      operation1.position += operation2.text.length;
    }
  } else if (operation2.type === 'delete') {
    if (operation1.position > operation2.position) {
      operation1.position -= Math.min(operation2.length, 
                                    operation1.position - operation2.position);
    }
  }

  return operation1;
};

const applyOperation = (content, operation) => {
  switch (operation.type) {
    case 'insert':
      return content.slice(0, operation.position) + 
             operation.text + 
             content.slice(operation.position);
    
    case 'delete':
      return content.slice(0, operation.position) + 
             content.slice(operation.position + operation.length);
    
    default:
      return content;
  }
};

const transformOperations = (pendingOps, concurrentOp) => {
  return pendingOps.map(op => transformOperation(op, concurrentOp));
};

const generateOperation = (oldContent, newContent, cursorPosition) => {
  // Find the first differing character
  let i = 0;
  const minLength = Math.min(oldContent.length, newContent.length);
  
  while (i < minLength && oldContent[i] === newContent[i]) {
    i++;
  }

  // If content is identical, return null
  if (i === oldContent.length && i === newContent.length) {
    return null;
  }

  // If text was added
  if (newContent.length > oldContent.length) {
    const addedText = newContent.slice(i, i + (newContent.length - oldContent.length));
    return {
      type: 'insert',
      position: cursorPosition || i,
      text: addedText
    };
  } 
  // If text was removed
  else {
    const removedLength = oldContent.length - newContent.length;
    return {
      type: 'delete',
      position: cursorPosition || i,
      length: removedLength
    };
  }
};

module.exports = {
  transformOperation,
  applyOperation,
  transformOperations,
  generateOperation
};