import CreateBoardCard from '../CreateBoardCard';

export default function CreateBoardCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <CreateBoardCard onCreate={() => console.log('Create new board')} />
    </div>
  );
}
