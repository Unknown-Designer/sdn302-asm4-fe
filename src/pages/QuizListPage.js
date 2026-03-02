import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchQuizzes } from '../store/slices/quizSlice';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

const QuizListPage = () => {
  const dispatch = useDispatch();
  const { quizzes, isLoading, isError, message } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Available Quizzes</h2>
      {isError && <Alert variant="danger">{message}</Alert>}
      {quizzes.length === 0 ? (
        <Alert variant="info">No quizzes available yet.</Alert>
      ) : (
        <Row>
          {quizzes.map((quiz) => (
            <Col md={4} key={quiz._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{quiz.title}</Card.Title>
                  <Card.Text className="text-muted">{quiz.description}</Card.Text>
                  <Card.Text>
                    <small className="text-muted">
                      {quiz.questions?.length || 0} question(s)
                    </small>
                  </Card.Text>
                  <Link to={`/quizzes/${quiz._id}`} className="btn btn-primary">
                    Take Quiz
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default QuizListPage;
