import React, { useCallback } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { actions, selectChannelsAllIds, selectChannelsById, selectCurrentChannelId, selectUser } from '../store';

const Channels = ({ showModal }) => {
  const dispatch = useDispatch();
  const channelsAllIds = useSelector(selectChannelsAllIds);
  const channelsById = useSelector(selectChannelsById);
  const currentChannelId = useSelector(selectCurrentChannelId);
  const user = useSelector(selectUser);

  const switchToChannel = useCallback(
    (id) => {
      dispatch(actions.switchToChannel({ channelId: Number(id) }));
    },
    [dispatch],
  );

  const openRenameModal = (id) => (e) => {
    e.stopPropagation();
    const channel = channelsById[id];
    showModal('renaming', channel);
  };

  const openRemoveModal = (id) => (e) => {
    e.stopPropagation();
    const channel = channelsById[id];
    showModal('removing', channel);
  };

  return (
    <Nav activeKey={currentChannelId} onSelect={switchToChannel} className="flex-column" justify fill variant="pills">
      {channelsAllIds.map((id) => {
        const { name, removable } = channelsById[id];
        return (
          <Nav.Item key={id} as="btn-group">
            <Nav.Link eventKey={id}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-light">{name}</div>
                {!user.isGuest && (
                  <div>
                    <Button
                      className="fas fa-edit rounded-circle"
                      variant="outline-success"
                      size="sm"
                      onClick={openRenameModal(id)}
                    />
                    {removable && (
                      <Button
                        className="fas fa-trash-alt ml-2 rounded-circle"
                        variant="outline-danger"
                        size="sm"
                        onClick={openRemoveModal(id)}
                      />
                    )}
                  </div>
                )}
              </div>
            </Nav.Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default Channels;
