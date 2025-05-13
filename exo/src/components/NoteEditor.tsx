import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const NoteEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get the note if in edit mode
  const note = id
    ? useQuery(api.notes.get, { id: id as Id<'notes'> })
    : null;

  // Mutations for creating and updating notes
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);

  // Initialize form with note data if editing
  useEffect(() => {
    if (note) {
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (id) {
        // Update existing note
        await updateNote({
          id: id as Id<'notes'>,
          content
        });
      } else {
        // Create new note
        await createNote({
          content
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving note:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        {id ? 'Edit Note' : 'Create New Note'}
      </h2>

      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-700">
            Note Content
          </label>
          <textarea
            id="content"
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            required
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Note'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;
