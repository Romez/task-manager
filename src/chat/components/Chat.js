import React, { useRef, useCallback, useLayoutEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { post } from 'axios';
import useStayScrolled from 'react-stay-scrolled';

import routes from '../routes';
import { getChatNickname } from '../helpers';

import {
  selectMessagesById,
  selectCurrentChannelMessagesIds,
  selectCurrentChannelId,
  selectUser,
  selectUsersById,
} from '../store';

const validationSchema = Yup.object().shape({
  message: Yup.string().required('Required'),
});

const Chat = () => {
  const currentChannelId = useSelector(selectCurrentChannelId);
  const messagesById = useSelector(selectMessagesById);
  const currentChannelMessagesIds = useSelector(selectCurrentChannelMessagesIds);
  const user = useSelector(selectUser);
  const usersById = useSelector(selectUsersById);

  const messagesRef = useRef();
  const { stayScrolled } = useStayScrolled(messagesRef, { initialScroll: Infinity });
  useLayoutEffect(() => {
    stayScrolled();
  }, [stayScrolled, currentChannelMessagesIds.length]);

  const sendMessage = useCallback(
    async ({ message }, form) => {
      const payload = { data: { attributes: { body: message } } };
      const url = routes.channelMessagesPath(currentChannelId);

      try {
        const res = await post(url, payload);
        form.resetForm();
        return res.data;
      } catch (error) {
        form.setErrors({ message: error.message });
        return false;
      }
    },
    [currentChannelId],
  );

  const form = useFormik({
    initialValues: { message: '' },
    onSubmit: sendMessage,
    validationSchema,
  });

  return (
    <div className="d-flex flex-column h-100">
      <div className="overflow-auto mb-3" ref={messagesRef}>
        {currentChannelMessagesIds.map((id) => {
          const { body, userId } = messagesById[id];

          return (
            <div key={id}>
              <b>{`${getChatNickname(usersById[userId])}: `}</b>
              {body}
            </div>
          );
        })}
      </div>

      {!user.isGuest && (
        <Form onSubmit={form.handleSubmit} className="mt-auto">
          <Form.Group>
            <Form.Control
              name="message"
              isInvalid={!!form.errors.message}
              disabled={form.isSubmitting}
              onChange={form.handleChange}
              value={form.values.message}
            />
            {form.errors.message && <Form.Control.Feedback type="invalid">{form.errors.message}</Form.Control.Feedback>}
          </Form.Group>
        </Form>
      )}
    </div>
  );
};

export default Chat;
