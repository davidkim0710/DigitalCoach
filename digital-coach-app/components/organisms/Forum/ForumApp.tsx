import React, { useState, useEffect } from 'react';
import ThreadList from './ThreadList';
import NewThreadForm from './NewThreadForm';
import ForumService from './ForumService'; // Import ForumService

function ForumApp() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threadsData = await ForumService.getAllThreads();
        const threadsArray = await threadsData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setThreads(threadsArray);
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setLoading(false); // Set loading to false when fetching is complete
      }
    };

    fetchThreads();
  }, []);

  const handleNewThread = async (title, content) => {
    try {
      setLoading(true);
      await ForumService.createThread(title, content);
      const threadsData = await ForumService.getAllThreads();
      const threadsArray = await threadsData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreads(threadsArray);
    } catch (error) {
      console.error('Error creating or fetching threads:', error);
    } finally {
        setLoading(false); 
    }
  };

  return (
    <div>
      <h1>Discussion Forum</h1>
      <NewThreadForm onSubmit={handleNewThread} />
      {loading ? (
        <p>Loading threads...</p> // Display loading message when threads are being fetched
      ) : (
        <ThreadList threads={threads} />
      )}
    </div>
  );
}

export default ForumApp;
