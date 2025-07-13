import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Create Sui client for testnet
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// Updated with your deployed package ID
export const PACKAGE_ID = "0x4701dd624a570585650108cb43973ea65aaf64cb23866cc46a1e73ca4c3bd1e8";

// Helper function to create a new todo
export const createTodoTransaction = (content) => {
  const txb = new TransactionBlock();
  
  txb.moveCall({
    target: `${PACKAGE_ID}::todo::create_todo`,
    arguments: [
      txb.pure(content) // todo content
    ],
  });

  return txb;
};

// Helper function to toggle todo completion
export const toggleTodoTransaction = (todoId) => {
  const txb = new TransactionBlock();
  
  txb.moveCall({
    target: `${PACKAGE_ID}::todo::toggle_todo`,
    arguments: [
      txb.object(todoId)
    ],
  });

  return txb;
};

// Helper function to update todo content
export const updateTodoTransaction = (todoId, newContent) => {
  const txb = new TransactionBlock();
  
  txb.moveCall({
    target: `${PACKAGE_ID}::todo::update_todo`,
    arguments: [
      txb.object(todoId),
      txb.pure(newContent)
    ],
  });

  return txb;
};

// Helper function to delete todo
export const deleteTodoTransaction = (todoId) => {
  const txb = new TransactionBlock();
  
  txb.moveCall({
    target: `${PACKAGE_ID}::todo::delete_todo`,
    arguments: [
      txb.object(todoId)
    ],
  });

  return txb;
};

// Function to get all todos owned by an address
export const getTodos = async (ownerAddress) => {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${PACKAGE_ID}::todo::Todo`
      },
      options: {
        showContent: true,
        showType: true,
      }
    });

    return objects.data.map(obj => ({
      id: obj.data.objectId,
      content: obj.data.content.fields.content,
      completed: obj.data.content.fields.completed,
      owner: obj.data.content.fields.owner,
    }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};