import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { Channels, Chat, ChannelModals } from './components';
import { selectUser } from './store';

const App = () => {
  const { t } = useTranslation();

  const [modalInfo, setModalInfo] = useState({ type: null, channel: null });
  const hideModal = useCallback(() => setModalInfo({ type: null, channel: null }), [setModalInfo]);
  const showModal = useCallback((type, channel = null) => setModalInfo({ type, channel }), []);

  const showAddModal = useCallback(() => {
    showModal('adding');
  }, [showModal]);

  const user = useSelector(selectUser);

  return (
    <>
      <Container className="h-100 pb-3">
        <Row className="h-100 bg-dark text-white">
          <Col sm="3" className="border-right pt-2">
            <h3>{t('channels.title')}</h3>
            {!user.isGuest && (
              <Button onClick={showAddModal} className="mb-3" variant="outline-light">
                {t('channels.add')}
              </Button>
            )}
            <Channels showModal={showModal} />
          </Col>
          <Col className="h-100 pt-2">
            <Chat />
          </Col>
        </Row>
      </Container>
      <ChannelModals type={modalInfo.type} channel={modalInfo.channel} hideModal={hideModal} />
    </>
  );
};

export default App;
