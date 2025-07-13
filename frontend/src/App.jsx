import { useState, useEffect } from 'react';
import { useWallet, ConnectButton, useAccountBalance } from '@suiet/wallet-kit';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createTodoTransaction, 
  toggleTodoTransaction, 
  updateTodoTransaction, 
  deleteTodoTransaction,
  getTodos,
  PACKAGE_ID 
} from './utils/suiClient';
import './App.css';

function App() {
  const { connected, account, signAndExecuteTransactionBlock, disconnect } = useWallet();
  
  // Debug wallet detection
  useEffect(() => {
    console.log('Wallet connected:', connected);
    console.log('Account:', account);
  }, [connected, account]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  // Fetch todos using React Query
  const { data: todos = [], isLoading, refetch } = useQuery({
    queryKey: ['todos', account?.address],
    queryFn: () => getTodos(account?.address),
    enabled: connected && !!account?.address,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleTransaction = async (transactionBlock, successMessage) => {
    if (!connected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const result = await signAndExecuteTransactionBlock({
        transactionBlock,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      if (result.effects?.status?.status === 'success') {
        setSuccess(successMessage);
        // Refresh todos after successful transaction
        setTimeout(() => refetch(), 1000);
      } else {
        // setError('Transaction failed');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!inputValue.trim()) {
      setError('Please enter a todo item');
      return;
    }

    const txb = createTodoTransaction(inputValue);
    await handleTransaction(txb, 'Todo added successfully!');
    setInputValue('');
  };

  const toggleTodo = async (todoId) => {
    const txb = toggleTodoTransaction(todoId);
    await handleTransaction(txb, 'Todo updated successfully!');
  };

  const deleteTodo = async (todoId) => {
    const txb = deleteTodoTransaction(todoId);
    await handleTransaction(txb, 'Todo deleted successfully!');
  };

  // Check if package ID is set
  const isPackageIdSet = PACKAGE_ID !== "YOUR_PACKAGE_ID_HERE";

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 Sui Todo DApp</h1>
        <p>Build your todos on the Sui blockchain</p>
      </div>

      <div className="card">
        <div className="wallet-section">
          {!connected ? (
            <div>
              <p>Connect your Suiet wallet to get started</p>
              <ConnectButton>Connect Wallet</ConnectButton>
              <br /><br />
              <p>Don't have Suiet wallet?</p>
              <button 
                className="btn btn-secondary" 
                onClick={() => window.open('https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd', '_blank')}
              >
                Install Suiet Wallet
              </button>
            </div>
          ) : (
            <div className="success">
              ✅ Connected: {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
              <div style={{marginTop: '10px'}}>
                <ConnectButton>Disconnect</ConnectButton>
              </div>
            </div>
          )}
        </div>

        {!isPackageIdSet && (
          <div className="error">
            ⚠️ Please deploy your Move package and update PACKAGE_ID in utils/suiClient.js
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {success && (
          <div className="success">
            {success}
          </div>
        )}

        {connected && isPackageIdSet && (
          <>
            <div className="input-group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What needs to be done?"
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                disabled={loading}
              />
              <button 
                className="btn" 
                onClick={addTodo}
                disabled={loading || !inputValue.trim()}
              >
                {loading ? 'Adding...' : 'Add Todo'}
              </button>
            </div>

            <div className="todos-section">
              {isLoading ? (
                <div className="loading">Loading todos...</div>
              ) : todos.length === 0 ? (
                <div className="loading">
                  No todos yet. Add one above! 
                </div>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                    <div className="todo-content">
                      {todo.content}
                    </div>
                    <div className="todo-actions">
                      <button 
                        className="btn btn-small btn-success" 
                        onClick={() => toggleTodo(todo.id)}
                        disabled={loading}
                      >
                        {todo.completed ? 'Undo' : 'Done'}
                      </button>
                      <button 
                        className="btn btn-small btn-danger" 
                        onClick={() => deleteTodo(todo.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {connected && isPackageIdSet && (
        <div className="card">
          <h3>📊 Stats</h3>
          <p>Total Todos: {todos.length}</p>
          <p>Completed: {todos.filter(t => t.completed).length}</p>
          <p>Pending: {todos.filter(t => !t.completed).length}</p>
        </div>
      )}
    </div>
  );
}

export default App;