import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  resetQuizState,
} from '../store/slices/quizSlice';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ManageQuizzesPage = () => {
  const dispatch = useDispatch();
  const { quizzes, isLoading, isError, message } = useSelector((state) => state.quizzes);

  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [deletingQuizTitle, setDeletingQuizTitle] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes());
    return () => {
      dispatch(resetQuizState());
    };
  }, [dispatch]);

  const handleShowCreate = () => {
    setEditingQuiz(null);
    setFormData({ title: '', description: '' });
    setShowModal(true);
  };

  const handleShowEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({ title: quiz.title, description: quiz.description || '' });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setFormData({ title: '', description: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingQuiz) {
      dispatch(updateQuiz({ id: editingQuiz._id, quizData: formData }));
    } else {
      dispatch(createQuiz(formData));
    }
    handleClose();
  };

  const handleDelete = (id, title) => {
    setDeletingQuizId(id);
    setDeletingQuizTitle(title);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingQuizId) {
      dispatch(deleteQuiz(deletingQuizId));
    }
    setShowDeleteModal(false);
    setDeletingQuizId(null);
    setDeletingQuizTitle('');
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingQuizId(null);
    setDeletingQuizTitle('');
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Quizzes</h2>
        <Button variant="success" onClick={handleShowCreate}>
          + Create Quiz
        </Button>
      </div>

      {isError && <Alert variant="danger">{message}</Alert>}

      {quizzes.length === 0 ? (
        <Alert variant="info">No quizzes yet. Create one!</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, index) => (
              <tr key={quiz._id}>
                <td>{index + 1}</td>
                <td>{quiz.title}</td>
                <td>{quiz.description}</td>
                <td>
                  <Badge bg="info">{quiz.questions?.length || 0}</Badge>
                </td>
                <td>
                  <Link
                    to={`/admin/quizzes/${quiz._id}/questions`}
                    className="btn btn-sm btn-info me-2"
                  >
                    Manage Questions
                  </Link>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(quiz)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(quiz._id, quiz.title)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter quiz title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter quiz description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingQuiz ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="mb-1">Are you sure you want to delete this quiz?</p>
          <p className="fw-bold text-dark mb-0">"{deletingQuizTitle}"</p>
          <small className="text-muted">This action cannot be undone. All associated data will be permanently removed.</small>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Quiz
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageQuizzesPage;
