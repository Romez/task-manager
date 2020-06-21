import React, { useRef, useEffect, useCallback } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { patch } from 'axios';

import routes from '../../routes';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
});

const Rename = ({ hideModal, channel }) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async ({ name }, form) => {
      const payload = { data: { attributes: { name } } };
      const url = routes.channelPath(channel.id);

      try {
        await patch(url, payload);
        hideModal();
        return true;
      } catch (error) {
        form.setErrors({ name: error.message });
        return false;
      }
    },
    [hideModal, channel.id],
  );

  const form = useFormik({
    initialValues: { name: channel.name },
    onSubmit: handleSubmit,
    validationSchema,
  });

  const inputRef = useRef();
  useEffect(() => {
    inputRef.current.focus();
    inputRef.current.select();
  }, [inputRef]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t('channels.modals.rename.title')}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={form.handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              ref={inputRef}
              name="name"
              isInvalid={!!form.errors.name}
              disabled={form.isSubmitting}
              onChange={form.handleChange}
              value={form.values.name}
            />
            <Form.Control.Feedback type="invalid">{form.errors.name}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            {t('channels.modals.close')}
          </Button>
          <Button variant="primary" type="submit" disabled={form.isSubmitting}>
            <Spinner
              hidden={!form.isSubmitting}
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
              variant="info"
            />
            {t(form.isSubmitting ? 'channels.modals.rename.loading' : 'channels.modals.rename.submit')}
          </Button>
        </Modal.Footer>
      </Form>
    </>
  );
};

export default Rename;
