import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FaVideo, FaUserPlus } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";

// ----- Animations -----
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
  70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ----- Styled Components -----
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a2e);
  background-size: 400% 400%;
  animation: ${gradientMove} 15s ease infinite;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

// Floating background blobs
const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
  animation: ${float} 10s ease-in-out infinite;
  &:nth-child(1) {
    width: 400px;
    height: 400px;
    top: -150px;
    left: -150px;
    background: #6366f1;
    animation-delay: 0s;
  }
  &:nth-child(2) {
    width: 350px;
    height: 350px;
    bottom: -100px;
    right: -100px;
    background: #ec4899;
    animation-delay: -5s;
  }
  &:nth-child(3) {
    width: 250px;
    height: 250px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #8b5cf6;
    animation-delay: -3s;
    opacity: 0.15;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 56px;
  padding: 60px 48px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  text-align: center;
  position: relative;
  z-index: 10;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  &:hover {
    transform: scale(1.02) translateY(-6px);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #a78bfa;
  animation: ${float} 6s ease-in-out infinite;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #818cf8, #f472b6);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 5s linear infinite;
  margin: 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  margin-top: 6px;
  margin-bottom: 40px;
  font-weight: 300;
  letter-spacing: 0.5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 18px 28px;
  font-size: 1.15rem;
  font-weight: 600;
  border: none;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 60px;
    padding: 2px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(236, 72, 153, 0.4));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 20px 40px -8px rgba(99, 102, 241, 0.3);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    font-size: 1.5rem;
    flex-shrink: 0;
  }
`;

const CreateButton = styled(StyledButton)`
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  animation: ${pulse} 2.5s infinite;

  &:hover {
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, #818cf8, #a78bfa);
  }
`;

const JoinButton = styled(StyledButton)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

// ----- Component (unchanged logic) -----
function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Animated background orbs */}
      <Blob />
      <Blob />
      <Blob />

      <Card>
        <Logo>
          <IconWrapper>
            <GiArtificialIntelligence />
          </IconWrapper>
          <Title>FocusMeet AI</Title>
        </Logo>

        <Subtitle>Your intelligent meeting assistant</Subtitle>

        <ButtonGroup>
          <CreateButton onClick={() => navigate("/create")}>
            <FaVideo />
            Create Meeting
          </CreateButton>

          <JoinButton onClick={() => navigate("/join")}>
            <FaUserPlus />
            Join Meeting
          </JoinButton>
        </ButtonGroup>
      </Card>
    </Container>
  );
}

export default Dashboard;