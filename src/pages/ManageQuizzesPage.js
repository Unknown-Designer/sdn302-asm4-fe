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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      dispatch(deleteQuiz(id));
    }
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
                    onClick={() => handleDelete(quiz._id)}
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
    </Container>
  );
};

export default ManageQuizzesPage;
