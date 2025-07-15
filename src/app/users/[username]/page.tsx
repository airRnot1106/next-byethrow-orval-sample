import { Result } from '@praha/byethrow';
import {
  ordersGetOrderItems,
  ordersGetOrdersByUserId,
  usersGetUser,
} from '../../../lib/generated/fetchers/eCSiteAPI';

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  const orderItems = Result.pipe(
    Result.do(),
    Result.andThen(() => usersGetUser(username)),
    Result.andThen((user) =>
      ordersGetOrdersByUserId({
        userId: user.id,
      }),
    ),
    Result.andThen((orders) =>
      Result.combine(orders.map((order) => ordersGetOrderItems(order.id))),
    ),
    Result.mapError((errors) => (Array.isArray(errors) ? errors : [errors])),
  );
}
