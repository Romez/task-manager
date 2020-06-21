import React, { useCallback } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import axios from 'axios';

import routes from '../../routes';

const Remove = ({ hideModal, channel }) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async (_, form) => {
      const url = routes.channelPath(channel.id);

      try {
        await axios.delete(url);
        hideModal();
      } catch (error) {
        form.setErrors(error.message);
      }
    },
    [channel.id, hideModal],
  );

  const form = useFormik({
    initialValues: {},
    onSubmit: handleSubmit,
  });

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t('channels.modals.remove.title')}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={form.handleSubmit}>
        <Modal.Body>
          <p>{t('channels.modals.remove.description')}</p>
          <p className="text-danger">{form.error}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            {t('channels.modals.close')}
          </Button>
          <Button variant="danger" type="submit" disabled={form.isSubmitting}>
            <Spinner
              hidden={!form.isSubmitting}
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
              variant="info"
            />
            {t(form.isSubmitting ? 'channels.modals.remove.loading' : 'channels.modals.remove.submit')}
          </Button>
        </Modal.Footer>
      </Form>
    </>
  );
};

export default Remove;
