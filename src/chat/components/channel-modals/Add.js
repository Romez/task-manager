import React, { memo, useCallback, useRef, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { post } from 'axios';

import routes from '../../routes';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
});

const AddModal = ({ hideModal }) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async ({ name }, form) => {
      const payload = { data: { attributes: { name } } };
      const url = routes.channelsPath();

      try {
        await post(url, payload);
        hideModal();
        return true;
      } catch (error) {
        form.setErrors({ name: error.message });
        return false;
      }
    },
    [hideModal],
  );

  const form = useFormik({
    initialValues: { name: '' },
    onSubmit: handleSubmit,
    validationSchema,
  });

  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t('channels.modals.add.title')}</Modal.Title>
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
            {t(form.isSubmitting ? 'channels.modals.add.loading' : 'channels.modals.add.submit')}
          </Button>
        </Modal.Footer>
      </Form>
    </>
  );
};

export default memo(AddModal);
