import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuizById, addQuestionToQuiz, clearCurrentQuiz } from '../store/slices/quizSlice';
import { deleteQuestionAPI, updateQuestionAPI } from '../services/api';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Card,
} from 'react-bootstrap';

const ManageQuizQuestionsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuiz, isLoading, isError, message } = useSelector((state) => state.quizzes);

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    keywords: '',
  });

  useEffect(() => {
    dispatch(fetchQuizById(id));
    return () => {
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch, id]);

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

  const handleSubmit = async (e) => {
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
      try {
        await updateQuestionAPI(editingQuestion._id, questionData);
        dispatch(fetchQuizById(id)); // Refresh
      } catch (error) {
        alert('Failed to update question: ' + (error.response?.data?.error || error.message));
      }
    } else {
      dispatch(addQuestionToQuiz({ quizId: id, questionData }));
    }
    handleClose();
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestionAPI(questionId);
        dispatch(fetchQuizById(id)); // Refresh
      } catch (error) {
        alert('Failed to delete question: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (isLoading || !currentQuiz) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/admin/quizzes')}>
        &larr; Back to Quizzes
      </Button>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{currentQuiz.title}</Card.Title>
          <Card.Text className="text-muted">{currentQuiz.description}</Card.Text>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Questions ({currentQuiz.questions?.length || 0})</h4>
        <Button variant="success" onClick={handleShowCreate}>
          + Add Question
        </Button>
      </div>

      {isError && <Alert variant="danger">{message}</Alert>}

      {!currentQuiz.questions || currentQuiz.questions.length === 0 ? (
        <Alert variant="info">No questions yet. Add one!</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Question Text</th>
              <th>Options</th>
              <th>Correct Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentQuiz.questions.map((question, index) => (
              <tr key={question._id}>
                <td>{index + 1}</td>
                <td>{question.text}</td>
                <td>
                  <ol className="mb-0" start={0}>
                    {question.options?.map((opt, i) => (
                      <li
                        key={i}
                        className={
                          i === question.correctAnswerIndex ? 'fw-bold text-success' : ''
                        }
                      >
                        {opt}
                      </li>
                    ))}
                  </ol>
                </td>
                <td>{question.options?.[question.correctAnswerIndex]}</td>
                <td>
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
                    onClick={() => handleDeleteQuestion(question._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create/Edit Question Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
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
            <Button variant="outline-secondary" size="sm" onClick={addOption} className="mb-3">
              + Add Option
            </Button>

            <Form.Group className="mb-3">
              <Form.Label>Keywords (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., geography, capital, europe"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingQuestion ? 'Update' : 'Add Question'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageQuizQuestionsPage;
