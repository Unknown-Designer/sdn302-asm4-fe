import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  resetQuestionState,
} from '../store/slices/questionSlice';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from 'react-bootstrap';

const ManageQuestionsPage = () => {
  const dispatch = useDispatch();
  const { questions, isLoading, isError, message } = useSelector(
    (state) => state.questions
  );
  const { user } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    keywords: '',
  });

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const [deletingQuestionText, setDeletingQuestionText] = useState('');

  useEffect(() => {
    dispatch(fetchQuestions());
    return () => {
      dispatch(resetQuestionState());
    };
  }, [dispatch]);

  const handleShowCreate = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      keywords: '',
    });
    setShowModal(true);
  };

  const handleShowEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      options: [...question.options],
      correctAnswerIndex: question.correctAnswerIndex,
      keywords: question.keywords?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswerIndex:
        formData.correctAnswerIndex >= newOptions.length
          ? 0
          : formData.correctAnswerIndex,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const questionData = {
      text: formData.text,
      options: formData.options.filter((opt) => opt.trim() !== ''),
      correctAnswerIndex: parseInt(formData.correctAnswerIndex),
      keywords: formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k),
    };

    if (editingQuestion) {
      dispatch(updateQuestion({ id: editingQuestion._id, questionData }));
    } else {
      dispatch(createQuestion(questionData));
    }
    handleClose();
  };

  const handleDelete = (id, text) => {
    setDeletingQuestionId(id);
    setDeletingQuestionText(text);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingQuestionId) {
      dispatch(deleteQuestion(deletingQuestionId));
    }
    setShowDeleteModal(false);
    setDeletingQuestionId(null);
    setDeletingQuestionText('');
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingQuestionId(null);
    setDeletingQuestionText('');
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
        <h2>Manage Questions</h2>
        <Button variant="success" onClick={handleShowCreate}>
          + Create Question
        </Button>
      </div>

      {isError && <Alert variant="danger">{message}</Alert>}

      {questions.length === 0 ? (
        <Alert variant="info">No questions yet. Create one!</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Question Text</th>
              <th>Options</th>
              <th>Correct Answer</th>
              <th>Keywords</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question._id}>
                <td>{index + 1}</td>
                <td>{question.text}</td>
                <td>
                  <ol className="mb-0" start={0}>
                    {question.options?.map((opt, i) => (
                      <li
                        key={i}
                        className={
                          i === question.correctAnswerIndex
                            ? 'fw-bold text-success'
                            : ''
                        }
                      >
                        {opt}
                      </li>
                    ))}
                  </ol>
                </td>
                <td>{question.options?.[question.correctAnswerIndex]}</td>
                <td>{question.keywords?.join(', ')}</td>
                <td>
                  {user && (user._id === question.author || user.admin) && (
                    <>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEdit(question)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(question._id, question.text)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingQuestion ? 'Edit Question' : 'Create Question'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question Text</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter question text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Label>Options</Form.Label>
            {formData.options.map((option, index) => (
              <div key={index} className="d-flex mb-2 align-items-center">
                <Form.Check
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswerIndex === index}
                  onChange={() =>
                    setFormData({ ...formData, correctAnswerIndex: index })
                  }
                  className="me-2"
                  title="Mark as correct answer"
                />
                <Form.Control
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                {formData.options.length > 2 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => removeOption(index)}
                  >
                    X
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={addOption}
              className="mb-3"
            >
              + Add Option
            </Button>

            <Form.Group className="mb-3">
              <Form.Label>Keywords (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., geography, capital, europe"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingQuestion ? 'Update' : 'Create'}
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
          <p className="mb-1">Are you sure you want to delete this question?</p>
          <p className="fw-bold text-dark mb-0">"{deletingQuestionText}"</p>
          <small className="text-muted">This action cannot be undone. The question will be permanently removed.</small>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete Question
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageQuestionsPage;
