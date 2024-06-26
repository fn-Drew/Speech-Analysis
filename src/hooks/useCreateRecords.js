import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setNotification } from "../reducers/notificationReducer";
import recordsService from "../services/records";

const useCreateRecord = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    return useMutation((data) => recordsService.create(data.newRecord, data.user), {
        onSuccess: (encryptedRecord, data) => {
            queryClient.invalidateQueries(['records'])
            dispatch(setNotification(`${data.newRecord.record}`, 5));
        },
        onError: (err) => {
            dispatch(setNotification(err.response.data.error, 5));
        }
    });
}

export default useCreateRecord;
